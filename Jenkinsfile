pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Run Playwright tests') {
            steps {
                sh '''
                    echo "Running Playwright tests with ReportPortal reporter..."
                    npx playwright test
                '''
            }
        }
    }
}
