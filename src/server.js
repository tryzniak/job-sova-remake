const R = require("ramda");
const yup = require("yup");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("cookie-session");
const io = require("socket.io")();

const app = express();
const appV1 = express();
const sessionSecret = process.env.SESSION_SECRET || "budgies";
const sessionName = process.env.SESSION_NAME || "sova";
const domain = process.env.DOMAIN || "localhost";
const expiryDate = new Date(Date.now() + 60 * 60 * 1000);
const nanoid = require("nanoid/async");
const jwt = require("jsonwebtoken");
const jwtSecret = "budgies";

const sess = session({
  keys: ["userEmail"],
  secret: sessionSecret,
  name: sessionName,
  cookie: {
    secure: true,
    httpOnly: true,
    domain,
    expires: expiryDate
  }
});

const config = {
  auth: { user: "e232930c8aeaea", pass: "17fccdb327927a" },
  port: 2525,
  host: "smtp.mailtrap.io",
  from: "jobsova@soby.by"
};
const sendMail = require("./email-sender")(config);

const makeNotifyAdmin = UserService => subject => async (url) => {
  const admins = await UserService.where({ role: "admin" });
  const emails = [...new Set(admins.map(admin => admin.email))];

    return sendMail({
      to: emails,
      subject: subject,
      bodyHtml: `Для просмотра пройдите по ссылке <a href="localhost:3000/${url}">localhost:3000/${url}</a>`
    });
};


const makeDb = require("./makeDb");
const UserService = require("./user-service")(makeDb);
const sessionUser = require("./controllers/session-user")(UserService);
const notifyAdmin = makeNotifyAdmin(UserService);




const makeUsersOnlineStore = () => {
  const map = new Map();

  function get(userId) {
    return map.get(`userId=${userId}`);
  }

  function set(userId, socket) {
    map.set(`userId=${userId}`, socket.id);
  }

  return {
    get,
    set
  };
};

const ioAuthMiddleware = (UserService, store, allowedRoles) => (
  socket,
  next
) => {
  const token = verifyUpdatesToken(socket.handshake.query.token);
  if (!token || !allowedRoles.includes(token.role)) {
    return next(new Error("Cannot authenticate"));
  }
  UserService.findByID(token.id)
    .then(user => {
      socket.user = user;
      store.set(token.id, socket);
      next(null, true);
    })
    .catch(next);
};

const adminsOnline = makeUsersOnlineStore();
const ioAdmins = io.of("admins");
ioAdmins.use(ioAuthMiddleware(UserService, adminsOnline, ["admin"]));
ioAdmins.on("connection", socket => {
  for (const [k, v] of Object.entries(AdminEvent)) {
    adminsEventEmitter.on(k, e => {
      socket.emit(v, e);
    });
  }
});

const ioJobseekers = io.of("jobseekers");
const jobSeekersOnline = makeUsersOnlineStore();

const ChatService = require("./chat-service")(makeDb);
function joinRooms(ChatService) {
  return function(socket, next) {
    ChatService.findRooms(socket.user.id)
      .then(rooms => {
        rooms.forEach(function(room) {
          socket.join(room.id);
        });
        socket.emit("availableChatRooms", rooms);
        next(null, true);
      })
      .catch(next);
  };
}

/*
ioJobseekers.use(
  ioAuthMiddleware(UserService, jobSeekersOnline, ["jobseeker"])
);
*/

const ioChats = io.of("/chats");
ioChats.use(
  ioAuthMiddleware(UserService, makeUsersOnlineStore(), [
    "employer",
    "jobseeker"
  ])
);

ioChats.use(joinRooms(ChatService));

const messageLinkResolver = messageId =>
  `localhost:3000/applications/messages/${messageId}`;

const makeNotifyMessageMailer = (ChatService, messageLinkResolver) => async (
  fromUser,
  applicationId,
  messageId
) => {
  return ChatService.roomParticipantsEmails(applicationId).then(emails => {
    return sendEmail({
      to: emails.filter(email => fromUser.email != email),
      subject: "JobSova. Уведомление о сообщении",
      bodyHtml: `У вас есть непрочитанное сообщение: ${messageLinkResolver(
        messageId
      )}`
    });
  });
};

const mailMissedMessage = makeNotifyMessageMailer(
  ChatService,
  messageLinkResolver
);

ioChats.on("connection", socket => {
  socket.on("chatMessage", e => {
    ioChats.in(e.roomId).clients((err, clients) => {
      if (err) {
        throw err;
      }
      socket.in(e.roomId).emit("chatMessage", {
        text: e.text,
        fromUser: { id: socket.user.id, role: socket.user.role }
      });
      ChatService.saveMessage({
        text: e.text,
        fromUserId: socket.user.id,
        applicationId: e.roomId
      }).then(messageId => {
        // where are alone in the chat
        // so notify offline chat participants over email
        if (clients.length === 1) {
          mailMissedMessage(socket.user, e.roomId, messageId);
        }
      });
    });
  });
});

appV1.use(sess);

appV1.use(cors());
appV1.use(bodyParser.json());

const toCallback = controller => async (req, res) => {
  try {
    const response = await controller(req);
    res.headers = { ...res.headers, ...response.headers };
    if (response.session) {
      req.session["userEmail"] = response.session.userEmail;
    }

    if (!response.body) {
      return res.sendStatus(response.status);
    }

    res.status(response.status).json(response.body);
  } catch (e) {
    console.error(e);

    if (e.code === "ER_VALIDATE") {
      res.status(400);
      res.json({
        error: {
          message: e.message,
          code: e.code
        }
      });
      return;
    }

    if (
      e.code === "ER_DUP_ENTRY" &&
      (e.message.includes("email") || e.message.includes("phone"))
    ) {
      res.status(400);
      res.json({
        error: {
          message: "User already exists",
          code: e.code
        }
      });
      return;
    }

    if (e.code === "ER_DUP_ENTRY" && e.message.includes("title")) {
      res.status(400);
      res.json({
        error: {
          message: "A duplicate title",
          code: e.code
        }
      });
      return;
    }

    if (e.message.includes("Not found") || e.message.includes("Not Found")) {
      res.status(404);
      res.json({
        error: {
          message: "Not found",
          code: e.code
        }
      });
      return;
    }

    res.status(500);
    res.json({
      error: {
        message: "Internal server error",
        code: "ER_SERVER"
      }
    });
  }
};

const CitizenshipService = require("./citizenship-service")(makeDb);
appV1.get(
  "/citizenships",
  toCallback(
    require("./controllers/all-citizenships")(
      require("./use-cases/all-citizenships")(CitizenshipService)
    )
  )
);

appV1.post(
  "/citizenships",
  toCallback(
    sessionUser(
      require("./controllers/create-citizenship")(
        require("./use-cases/create-citizenship")(CitizenshipService)
      )
    )
  )
);

appV1.patch(
  "/citizenships/:id",
  toCallback(
    sessionUser(
      require("./controllers/edit-citizenship")(
        require("./use-cases/edit-citizenship")(CitizenshipService)
      )
    )
  )
);

const VacancyService = require("./vacancy-service")(makeDb);
appV1.get(
  "/vacancies",
  toCallback(
    sessionUser(
      require("./controllers/all-vacancies-for-jobseekers")(
        require("./use-cases/all-vacancies-for-jobseekers")(VacancyService)
      )
    )
  )
);

appV1.put(
  "/vacancies/:id/moderationStatus",
  toCallback(
    sessionUser(
      require("./controllers/edit-vacancy")(
        require("./use-cases/moderate-vacancy")(VacancyService)
      )
    )
  )
);

appV1.patch(
  "/vacancies/:id",
  toCallback(
    require("./controllers/edit-vacancy")(
      require("./use-cases/edit-vacancy")(VacancyService)
    )
  )
);

appV1.get(
  "/vacancies/:id",
  toCallback(
    sessionUser(
      require("./controllers/show-vacancy")(
        require("./use-cases/show-vacancy")(VacancyService)
      )
    )
  )
);

appV1.delete(
  "/vacancies/:id",
  toCallback(
    sessionUser(
      require("./controllers/delete-vacancy")(
        require("./use-cases/delete-vacancy")(VacancyService)
      )
    )
  )
);

const EducationService = require("./education-service")(makeDb);
appV1.get(
  "/educations",
  toCallback(
    require("./controllers/all-educations")(
      require("./use-cases/all-educations")(EducationService)
    )
  )
);

const SpecialtyService = require("./specialty-service")(makeDb);
appV1.get(
  "/specialties",
  toCallback(
    sessionUser(
      require("./controllers/employer-lists-specialties")(
        require("./use-cases/employer-lists-specialties")(SpecialtyService)
      )
    )
  )
);

const EmployerService = require("./employer-service")(makeDb);
appV1.get(
  "/employers",
  toCallback(
    sessionUser(
      require("./controllers/all-employers")(
        require("./use-cases/all-employers")(EmployerService)
      )
    )
  )
);

const OccupationService = require("./occupation-service")(makeDb);
appV1.get(
  "/occupations",
  toCallback(
    require("./controllers/all-occupations")(
      require("./use-cases/all-occupations")(OccupationService)
    )
  )
);

const SkillService = require("./skill-service")(makeDb);
appV1.get(
  "/skills",
  toCallback(
    sessionUser(
      require("./controllers/all-skills")(
        require("./use-cases/all-skills")(SkillService)
      )
    )
  )
);

appV1.get(
  "/skills/:id",
  toCallback(
    sessionUser(
      require("./controllers/show-skill")(
        require("./use-cases/show-skill")(SkillService)
      )
    )
  )
);

const DisabilityTypeService = require("./disability-type-service")(makeDb);
appV1.get(
  "/disabilityTypes",
  toCallback(
    require("./controllers/all-disabilities")(
      require("./use-cases/all-disabilities")(DisabilityTypeService)
    )
  )
);

const DisabilityGroupService = require("./disability-group-service")(makeDb);
appV1.get(
  "/disabilityTypes",
  toCallback(
    require("./controllers/all-disabilities")(
      require("./use-cases/all-disabilities")(DisabilityGroupService)
    )
  )
);

const ResumeService = require("./resume-service")(makeDb);
appV1.post(
  "/resumes",
  toCallback(
    sessionUser(
      require("./controllers/create-resume")(
        require("./use-cases/jobseeker-creates-resume")(
          ResumeService,
          notifyAdmin("Резюме ждет модерации")
        )
      )
    )
  )
);

const algoliaSearchPlaces = require("algoliasearch").initPlaces();
appV1.get(
  "/geocode",
  toCallback(
    require("./controllers/employer-geocodes-address")(
      require("./use-cases/employer-geocodes-address")(
        require("./geocode-service")(algoliaSearchPlaces)
      )
    )
  )
);

appV1.patch(
  "/resumes/:id",
  toCallback(
    sessionUser(
      require("./controllers/edit-resume")(
        require("./use-cases/edit-resume")(
          ResumeService,
          notifyAdmin("Резюме ждет модерации")
        )
      )
    )
  )
);

appV1.put(
  "/resumes/:id/moderationStatus",
  toCallback(
    sessionUser(
      require("./controllers/edit-resume")(
        require("./use-cases/moderate-resume")(ResumeService)
      )
    )
  )
);

appV1.delete(
  "/resumes/:id",
  toCallback(
    sessionUser(
      require("./controllers/delete-resume")(
        require("./use-cases/delete-resume")(ResumeService)
      )
    )
  )
);

appV1.get(
  "/resumes",
  toCallback(
    sessionUser(
      require("./controllers/all-resumes")(
        require("./use-cases/all-resumes")(ResumeService)
      )
    )
  )
);

appV1.get(
  "/resumes/:id",
  toCallback(
    sessionUser(
      require("./controllers/show-resume")(
        require("./use-cases/show-resume")(ResumeService)
      )
    )
  )
);

appV1.post(
  "/vacancies",
  toCallback(
    sessionUser(
      require("./controllers/create-vacancy")(
        require("./use-cases/create-vacancy")(VacancyService, notifyAdmin("Вакансия ждет модерации"))
      )
    )
  )
);

const ApplicationService = require("./application-service")(makeDb);
appV1.post(
  "/applications/resumes/:resumeId/vacancies/:vacancyId",
  toCallback(
    sessionUser(
      require("./controllers/apply-to-vacancy-with-resume")(
        require("./use-cases/apply-to-vacancy-with-resume")(ApplicationService)
      )
    )
  )
);

appV1.post(
  "/applications/jobSeekers/:jobSeekerId/vacancies/:vacancyId",
  toCallback(
    sessionUser(
      require("./controllers/apply-to-vacancy-without-resume")(
        require("./use-cases/apply-to-vacancy-without-resume")(
          ApplicationService
        )
      )
    )
  )
);

const verifyPassword = require("./verify-password");
const signinUseCase = require("./use-cases/signin")(
  UserService,
  verifyPassword
);

const signinController = require("./controllers/signin")(signinUseCase);
appV1.post("/signin", toCallback(signinController));

appV1.post("/signout", async function(req, res) {
  req.session.userEmail = undefined;
  req.user = undefined;
  return res.status(200).end();
});

const generateUpdatesToken = payload => jwt.sign(payload, jwtSecret);
const verifyUpdatesToken = token => {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (e) {
    return false;
  }
};

const generateConfirmEmailToken = nanoid;
appV1.post(
  "/employers",
  toCallback(
    require("./controllers/signup-user")(
      require("./use-cases/signup-employer")(
        EmployerService,
        generateUpdatesToken,
        require("./use-cases/user-begins-email-change")(
          UserService,
          async (email, url) =>
            await sendMail({
              to: [email],
              subject: "Регистрация в Job Sova",
              bodyHtml: `Для для завершения регистрации пройдите по ссылке <a href="${url}">${url}</a>`
            }),
          nanoid,
          async token => `localhost:3000/change-email/${token}`
        )
      )
    )
  )
);

appV1.patch(
  "/employers/:id",
  toCallback(
    sessionUser(
      require("./controllers/edit-employer")(
        require("./use-cases/edit-employer")(EmployerService)
      )
    )
  )
);

const JobseekerService = require("./jobseeker-service")(makeDb);
appV1.post(
  "/jobseekers",
  toCallback(
    require("./controllers/signup-jobseeker")(
      require("./use-cases/signup-jobseeker")(
        JobseekerService,
        generateUpdatesToken,
        require("./use-cases/user-begins-email-change")(
          UserService,
          async (email, url) =>
            await sendMail({
              to: [email],
              subject: "Регистрация в Job Sova",
              bodyHtml: `Для для завершения регистрации пройдите по ссылке <a href="${url}">${url}</a>`
            }),
          nanoid,
          async token => `localhost:3000/change-email/${token}`
        )
      )
    )
  )
);

appV1.delete(
  "/users/:id",
  toCallback(
    sessionUser(
      require("./controllers/delete-user")(
        require("./use-cases/delete-user")({
          EmployerService,
          JobseekerService
        })
      )
    )
  )
);

const CallbackService = require("./callback-service")(makeDb);
appV1.post(
  "/callbacks/jobseekers/:jobSeekerId/partners/:partnerId",
  toCallback(
    sessionUser(
      require("./controllers/jobseeker-requests-callback")(
        require("./use-cases/jobseeker-requests-callback")(
          CallbackService,
          notifyAdmin("Обратный звонок ждет модерации")
        )
      )
    )
  )
);

appV1.get(
  "/callbacks/",
  toCallback(
    sessionUser(
      require("./controllers/list-callbacks")(
        require("./use-cases/list-callbacks")(
          CallbackService,
        )
      )
    )
  )
);

appV1.put(
  "/callbacks/:id/moderationStatus",
  toCallback(
    sessionUser(
      require("./controllers/admin-moderates-callback")(
        require("./use-cases/admin-moderates-callback")(
          CallbackService,
          async (email, details) =>
            await sendMail({
              to: [email],
              subject: "JobSova. Заказ обратного звонка",
              bodyHtml: `Пользователь JobSova заказал обратный звонок: телефон "${details.phone}", сообщение" ${details.message}"`
            })
        )
      )
    )
  )
);

const QuestionService = require("./question-service")(makeDb);
appV1.post(
  "/questions/jobseekers/:jobSeekerId/partners/:partnerId",
  toCallback(
    sessionUser(
      require("./controllers/jobseeker-asks-question")(
        require("./use-cases/jobseeker-asks-question")(
          QuestionService,
          notifyAdmin("Вопрос ждет модерации")
        )
      )
    )
  )
);

appV1.get(
  "/questions/",
  toCallback(
    sessionUser(
      require("./controllers/list-questions")(
        require("./use-cases/list-questions")(
          QuestionService,
        )
      )
    )
  )
);

appV1.get(
  "/questions/:id",
  toCallback(
    sessionUser(
      require("./controllers/show-question")(
        require("./use-cases/show-question")(
          QuestionService,
        )
      )
    )
  )
);

appV1.put(
  "/questions/:id/moderationStatus",
  toCallback(
    sessionUser(
      require("./controllers/admin-moderates-question")(
        require("./use-cases/admin-moderates-question")(
          QuestionService,
          async (email, details) =>
            await sendMail({
              to: [email],
              subject: "JobSova. Заказ email консультации",
              bodyHtml: `Пользователь JobSova заказал консультацию: email "${details.userEmail}", сообщение" ${details.message}"`
            })
        )
      )
    )
  )
);

const PartnerService = require("./partner-service")(makeDb);
appV1.post(
  "/partners",
  toCallback(
    sessionUser(
      require("./controllers/admin-creates-partner")(
        require("./use-cases/admin-creates-partner")(PartnerService)
      )
    )
  )
);

appV1.get(
  "/partners/:id",
  toCallback(
    require("./controllers/show-partner")(
      require("./use-cases/show-partner")(PartnerService)
    )
  )
);

appV1.patch(
  "/partners/:id",
  toCallback(
    sessionUser(
      require("./controllers/edit-partner")(
        require("./use-cases/edit-partner")(PartnerService)
      )
    )
  )
);

appV1.get(
  "/jobseekers/:id",
  toCallback(
    sessionUser(
      require("./controllers/show-jobseeker")(
        require("./use-cases/show-jobseeker")(JobseekerService)
      )
    )
  )
);

const { hash } = require("argon2");
appV1.post(
  "/reset-password/:token",
  toCallback(
    require("./controllers/user-finishes-password-reset")(
      require("./use-cases/user-finishes-password-reset")(UserService, hash)
    )
  )
);

appV1.post(
  "/change-email/:token",
  toCallback(
    sessionUser(
      require("./controllers/user-finishes-email-change")(
        require("./use-cases/user-finishes-email-change")(UserService)
      )
    )
  )
);

appV1.post(
  "/change-email",
  toCallback(
    sessionUser(
      require("./controllers/user-begins-email-change")(
        require("./use-cases/user-begins-email-change")(
          UserService,
          async (email, url) =>
            await sendMail({
              to: [email],
              subject: "Смена адреса email в Job Sova",
              bodyHtml: `Для для сменя адреса email кликните на ссылку <a href="${url}">${url}</a>`
            }),
          nanoid,
          async token => `localhost:3000/change-email/${token}`
        )
      )
    )
  )
);

appV1.post(
  "/reset-password/",
  toCallback(
    require("./controllers/user-begins-password-reset")(
      require("./use-cases/user-begins-password-reset")(
        UserService,
        async (email, url) =>
          await sendMail({
            to: [email],
            subject: "Восстановление пароля Job Sova",
            bodyHtml: `Для восстановления пароля кликните на ссылку <a href="${url}">${url}</a>`
          }),
        async token => `localhost:3000/reset-password/${token}`,
        nanoid
      )
    )
  )
);

appV1.patch(
  "/jobseekers/:id",
  toCallback(
    sessionUser(
      require("./controllers/edit-jobseeker")(
        require("./use-cases/edit-jobseeker")(JobseekerService)
      )
    )
  )
);

appV1.get(
  "/me/applications",
  toCallback(
    sessionUser(
      require("./controllers/list-applications")(
        require("./use-cases/list-applications")(ApplicationService)
      )
    )
  )
);

appV1.get(
  "/employers/:id/vacancies",
  toCallback(
    sessionUser(
      require("./controllers/list-employer-vacancies")(
        require("./use-cases/list-employer-vacancies")(VacancyService)
      )
    )
  )
);

appV1.get(
  "/jobseekers/:id/resumes",
  toCallback(
    sessionUser(
      require("./controllers/list-jobseeker-resumes")(
        require("./use-cases/list-jobseeker-resumes")(ResumeService)
      )
    )
  )
);

appV1.delete(
  "/applications/messages/:id",
  toCallback(
    sessionUser(
      require("./controllers/delete-application-message")(
        require("./use-cases/delete-application-message")(ApplicationService)
      )
    )
  )
);

appV1.get(
  "/applications/messages/:id",
  toCallback(
    sessionUser(
      require("./controllers/show-application-message")(
        require("./use-cases/show-application-message")(ChatService)
      )
    )
  )
);

appV1.get(
  "/applications/messages",
  toCallback(
    sessionUser(
      require("./controllers/show-user-messages")(
        require("./use-cases/show-user-messages")(ChatService)
      )
    )
  )
);

const CourseService = require("./course-service")(makeDb);
appV1.get(
  "/courses/",
  toCallback(
    require("./controllers/list-courses")(
      require("./use-cases/list-courses")(CourseService)
    )
  )
);

appV1.post(
  "/courses/",
  toCallback(
    sessionUser(
      require("./controllers/create-course")(
        require("./use-cases/create-course")(CourseService)
      )
    )
  )
);

appV1.patch(
  "/courses/:id",
  toCallback(
    sessionUser(
      require("./controllers/edit-course")(
        require("./use-cases/edit-course")(CourseService)
      )
    )
  )
);

appV1.delete(
  "/courses/:id",
  toCallback(
    sessionUser(
      require("./controllers/delete-course")(
        require("./use-cases/delete-course")(CourseService)
      )
    )
  )
);

appV1.get(
  "/courses/:id",
  toCallback(
    require("./controllers/show-course")(
      require("./use-cases/show-course")(CourseService)
    )
  )
);

const path = require("path");
const profileImgsDir = path.resolve("public");
const sharp = require("sharp");
appV1.use("/profile-imgs/", express.static(profileImgsDir));

const processImage = require("./make-image-pipeline")(
  async format => `${await nanoid()}.${format}`,
  fileName => path.join(profileImgsDir, fileName),
  "jpeg",
  512,
  512
);
const multer = require("multer");
appV1.use(
  "/users/:userId/upload-profile-pic",
  multer({ mimetype: "image/*", limits: { fileSize: 1000000 } }).single(
    "image"
  ),
  toCallback(
    sessionUser(
      require("./controllers/user-uploads-profile-pic")(
        require("./use-cases/user-uploads-profile-pic")(
          UserService,
          processImage
        )
      )
    )
  )
);

app.use("/api/v1/", appV1)

module.exports = { httpServer: app, wsServer: io };
