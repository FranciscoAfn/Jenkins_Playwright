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
                    echo "Running Playwright tests with forced HTML reporter..."
                    npx playwright test --reporter=html --output=test-results
        
                    echo "Copying full report to playwright-report..."
                    rm -rf playwright-report
                    cp -r test-results/playwright-report playwright-report || true
        
                    echo "Listing playwright-report folder:"
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
