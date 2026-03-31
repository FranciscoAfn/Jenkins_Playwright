pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Install Playwright browsers') {
            steps {
                sh 'npx playwright install'
            }
        }

        stage('Run Playwright tests') {
            steps {
                sh '''
                    echo "Running Playwright tests..."
                    npx playwright test --reporter=html

                    echo "Listing report folder:"
                    ls -R playwright-report || true
                '''
            }
        }
    }

    post {
        always {
            publishHTML(target: [
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Test Report',
                keepAll: true,
                alwaysLinkToLastBuild: true
            ])
        }
    }
}
