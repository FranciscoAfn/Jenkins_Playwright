module.exports = {
  apiKey: "jenkins_315LcwOOQoaOKR5c9UXLOmEh7XvwefxAjqenOBWAgTvJ87-mO3W7R5NnraNthRER",
  endpoint: "http://localhost:8080/api/v2",
  project: "superadmin_personal",
  launch: "Playwright CI Run",
  description: "Playwright tests executed in Jenkins",
  attributes: [
    { key: "env", value: "ci" },
    { value: "playwright" }
  ]
};
