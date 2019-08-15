const R = require("ramda");
const yup = require("yup");
const cors = require("cors");
const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const bodyParser = require("body-parser");
const session = require("cookie-session");

const app = express();
const sessionSecret = process.env.SESSION_SECRET || "budgies";
const sessionName = process.env.SESSION_NAME || "sova";
const domain = process.env.DOMAIN || "localhost";
const expiryDate = new Date(Date.now() + 60 * 60 * 1000);

app.use(
  session({
    keys: ["userEmail"],
    secret: sessionSecret,
    name: sessionName,
    cookie: {
      secure: true,
      httpOnly: true,
      domain,
      expires: expiryDate
    }
  })
);

app.use(cors());
app.use(bodyParser.json());

const toCallback = controller => async (req, res) => {
  const response = await controller(req);
  res.headers = { ...res.headers, ...response.headers };
  if (response.session) {
    req.session["userEmail"] = response.session.userEmail;
  }

  res.status(response.status).json(response.body);
};

const makeDb = require("./makeDb");

const VacancyService = require("./vacancy-service")(makeDb);
app.get(
  "/vacancies",
  toCallback(
    require("./controllers/all-vacancies-for-jobseekers")(
      require("./use-cases/all-vacancies-for-jobseekers")(VacancyService)
    )
  )
);

app.put(
  "/vacancies/:id/moderate",
  require("./controllers/edit-vacancy")(
    require("./use-cases/moderate-vacancy")(VacancyService)
  )
);

app.put(
  "/vacancies/:id",
  require("./controllers/edit-vacancy")(
    require("./use-cases/edit-vacancy")(VacancyService)
  )
);

app.delete(
  "/vacancies/:id",
  require("./controllers/delete-vacancy")(
    require("./use-cases/delete-vacancy")(VacancyService)
  )
);

const ProfessionService = require("./profession-service")(makeDb);
app.get(
  "/professions",
  toCallback(
    require("./controllers/all-professions")(
      require("./use-cases/all-professions")(ProfessionService)
    )
  )
);

const EducationService = require("./education-service")(makeDb);
app.get(
  "/educations",
  toCallback(
    require("./controllers/all-educations")(
      require("./use-cases/all-educations")(EducationService)
    )
  )
);

const EmployerService = require("./employer-service")(makeDb);
app.get(
  "/employers",
  toCallback(
    require("./controllers/all-employers")(
      require("./use-cases/all-employers")(EmployerService)
    )
  )
);

const OccupationService = require("./occupation-service")(makeDb);
app.get(
  "/occupations",
  toCallback(
    require("./controllers/all-occupations")(
      require("./use-cases/all-occupations")(OccupationService)
    )
  )
);

const SkillService = require("./skill-service")(makeDb);
app.get(
  "/skills",
  toCallback(
    require("./controllers/all-skills")(
      require("./use-cases/all-skills")(SkillService)
    )
  )
);

const DisabilityService = require("./disability-service")(makeDb);
app.get(
  "/disabilities",
  toCallback(
    require("./controllers/all-disabilities")(
      require("./use-cases/all-disabilities")(DisabilityService)
    )
  )
);

const ResumeService = require("./resume-service")(makeDb);
app.post(
  "/resumes",
  toCallback(
    require("./controllers/create-resume")(
      require("./use-cases/jobseeker-creates-resume")(ResumeService)
    )
  )
);

app.put(
  "/resumes/:id",
  require("./controllers/edit-resume")(
    require("./use-cases/edit-resume")(ResumeService)
  )
);

app.put(
  "/resumes/:id/moderate",
  require("./controllers/edit-resume")(
    require("./use-cases/moderate-resume")(ResumeService)
  )
);

app.delete(
  "/resumes/:id",
  require("./controllers/delete-resume")(
    require("./use-cases/delete-resume")(ResumeService)
  )
);

app.get(
  "/resumes",
  toCallback(
    require("./controllers/all-resumes")(
      require("./use-cases/all-resumes")(ResumeService)
    )
  )
);

app.post(
  "/vacancies",
  toCallback(
    require("./controllers/create-vacancy")(
      require("./use-cases/create-vacancy")(VacancyService)
    )
  )
);

const ApplicationService = require("./application-service")(makeDb);
// TODO
// make sure an authenticated user can do it
app.post(
  "/applications",
  toCallback(
    require("./controllers/apply-to-vacancy")(
      require("./use-cases/apply-to-vacancy")(ApplicationService)
    )
  )
);

const UserService = require("./user-service")(makeDb);

const sessionUser = require("./controllers/session-user")(UserService);
const verifyPassword = require("./verify-password");
const signinUseCase = require("./use-cases/signin")(
  UserService,
  verifyPassword
);


const signinController = require("./controllers/signin")(signinUseCase);
app.post("/signin", toCallback(signinController));

app.post("/signout", async function(req, res) {
  req.session.userEmail = undefined;
  req.user = undefined;
  return res.status(200).end();
});

app.post(
  "/employers",
  toCallback(
    require("./controllers/signup-employer")(
      require("./use-cases/signup-employer")(EmployerService)
    )
  )
);

app.put(
  "/employers/:id",
  toCallback(
    require("./controllers/edit-employer")(
      require("./use-cases/edit-employer")(EmployerService)
    )
  )
);

const JobseekerService = require("./jobseeker-service");
app.post(
  "/jobseekers",
  toCallback(
    require("./controllers/signup-jobseeker")(
      require("./use-cases/signup-jobseeker")(JobseekerService)
    )
  )
);

const { hash } = require("argon2");
app.post(
  "/reset-password/:token",
  toCallback(
    require("./controllers/user-finishes-password-reset")(
      require("./use-cases/user-finishes-password-reset")(UserService, hash)
    )
  )
);

app.post(
  "/change-email/:token",
  toCallback(
    require("./controllers/user-finishes-email-change")(
      require("./use-cases/user-finishes-email-change")(UserService)
    )
  )
);

const nanoid = require("nanoid/async");
app.post(
  "/change-email",
  toCallback(
    require("./controllers/user-begins-email-change")(
      require("./use-cases/user-begins-email-change")(
        UserService,
        async (email, verificationUrl) => verificationUrl,
        nanoid
      )
    )
  )
);

const EmailSender = async (email, token) => token;
app.post(
  "/reset-password/",
  toCallback(
    require("./controllers/user-begins-password-reset")(
      require("./use-cases/user-begins-password-reset")(
        UserService,
        EmailSender,
        nanoid
      )
    )
  )
);

app.put(
  "/jobseekers/:id",
  toCallback(
    require("./controllers/edit-jobseeker")(
      require("./use-cases/edit-jobseeker")(JobseekerService)
    )
  )
);

const path = require("path");
const profileImgsDir = path.resolve("public");
const sharp = require("sharp");
app.use("/profile-imgs/", express.static(profileImgsDir));

const processImage = require("./make-image-pipeline")(
  async format => `${await nanoid()}.${format}`,
  fileName => path.join(profileImgsDir, fileName),
  "jpeg",
  512,
  512
);
const multer = require("multer");
app.use(
  "/:userId/upload-profile-pic",
  multer({ mimetype: "image/*", limits: { fileSize: 1000000 } }).single(
    "image"
  ),
  toCallback(
    require("./controllers/user-uploads-profile-pic")(
      require("./use-cases/user-uploads-profile-pic")(UserService, processImage)
    )
  )
);

module.exports = app;
