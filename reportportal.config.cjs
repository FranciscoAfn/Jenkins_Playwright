module.exports = {
  apiKey: "Jenkins_4wtt6XlzSRKCu5LIril4uDZqT3LtROGjHyUlpXrHD3GvSxO90JKJtDYtXTjG3lO1",
  endpoint: "localhost:8080/api/v2",
  project: "superadmin_personal",
  launch: "Playwright CI Run",
  description: "Playwright tests executed in Jenkins",
  attributes: [
    { key: "env", value: "ci" },
    { value: "playwright" }
  ]
};
