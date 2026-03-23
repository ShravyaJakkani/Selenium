pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "jakkani7"
        IMAGE_NAME = "my-k8s-app-selenium"
    }

    stages {

        stage('Checkout from GitHub') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/ShravyaJakkani/Selenium.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                docker build -t $DOCKERHUB_USER/$IMAGE_NAME:$BUILD_NUMBER .
                docker tag $DOCKERHUB_USER/$IMAGE_NAME:$BUILD_NUMBER $DOCKERHUB_USER/$IMAGE_NAME:latest
                '''
            }
        }

        stage('Login to DockerHub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                sh '''
                docker push $DOCKERHUB_USER/$IMAGE_NAME:$BUILD_NUMBER
                docker push $DOCKERHUB_USER/$IMAGE_NAME:latest
                '''
            }
        }

        stage('Start Minikube if not running') {
            steps {
                sh '''
                if ! minikube status | grep -q "apiserver: Running"; then
                    echo "Starting Minikube..."
                    minikube start --driver=docker --memory=2048 --cpus=2
                fi
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                # Apply manifests
                minikube kubectl -- apply -f k8s/deployment.yaml
                minikube kubectl -- apply -f k8s/service.yaml
                '''
            }
        }

        stage('Get Service URL') {
            steps {
                sh 'minikube service my-k8s-app-service --url'
            }
        }
    }
}
