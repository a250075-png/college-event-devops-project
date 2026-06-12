pipeline {

    agent any

    stages {

        stage('Checkout') {

            steps {

                git https://github.com/a250075-png/college-event-devops-project.git
            }
        }

        stage('Build Docker Image') {

            steps {

                bat 'docker build -t college-event-app .'
            }
        }

        stage('Deploy Application') {

            steps {

                bat 'wsl ansible-playbook /home/soham/ansible-project/deploy.yml'
            }
        }
    }

    post {

        always {

            echo 'Pipeline Finished Successfully'
        }
    }
}