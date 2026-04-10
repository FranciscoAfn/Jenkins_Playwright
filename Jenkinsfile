pipeline {
  agent any

  parameters {
    string(name: 'TEST_PATH', defaultValue: 'tests', description: 'Folder or test file to run')
    string(name: 'TEST_TAG', defaultValue: '', description: 'Optional tag (e.g. @example)')
    choice(name: 'BROWSER', choices: ['chromium', 'firefox', 'webkit'], description: 'Browser')
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Validate Input') {
      steps {
        script {
          if (params.TEST_TAG?.trim()) {
            echo " Running by tag: ${params.TEST_TAG}"
          } else {
            if (!fileExists(params.TEST_PATH)) {
              error " Path '${params.TEST_PATH}' not found in repo"
            }
            echo " Found path: ${params.TEST_PATH}"
          }
        }
      }
    }


    stage('Run Tests') {
      steps {
        script {
          def cmd = ""

          if (params.TEST_TAG?.trim()) {
            cmd = "npx playwright test --grep ${params.TEST_TAG} --project=${params.BROWSER}"
          } else {
            cmd = "npx playwright test ${params.TEST_PATH} --project=${params.BROWSER}"
          }

          echo " Running: ${cmd}"
          sh cmd
        }
      }
    }

    stage('Archive Report') {
      steps {
        archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
      }
    }
  }

  post {
    always {
      echo ' Pipeline finished'
    }
    success {
      echo ' Tests passed'
    }
    failure {
      echo ' Tests failed'
    }
  }
}
