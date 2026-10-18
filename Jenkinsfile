// Smoke test: load the game headless, start a race, fail on any JS error.
pipeline {
  agent {
    docker { image 'mcr.microsoft.com/playwright/python:v1.49.0-noble' }
  }
  options { timeout(time: 10, unit: 'MINUTES') }
  stages {
    stage('Audio test') {
      steps {
        sh 'node tools/audio_test.cjs'
      }
    }
    stage('Cup schedule test') {
      steps {
        sh 'python3 tools/cup_schedule_test.py'
      }
    }
    stage('Shortcut test') {
      steps {
        sh 'python3 tools/shortcut_test.py'
      }
    }
    stage('Smoke test') {
      steps {
        sh 'python3 tools/smoke_test.py'
      }
    }
    stage('Touch test') {
      steps {
        sh 'python3 tools/touch_test.py'
      }
    }
  }
  post {
    always { archiveArtifacts artifacts: 'smoke.png', allowEmptyArchive: true }
  }
}
