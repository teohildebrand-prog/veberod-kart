// Smoke test: load the game headless, start a race, fail on any JS error.
pipeline {
  agent {
    docker { image 'mcr.microsoft.com/playwright/python:v1.49.0-noble' }
  }
  options { timeout(time: 30, unit: 'MINUTES') }   // six west tracks raced twice each
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
    stage('Signature item test') {
      steps {
        sh 'python3 tools/signature_test.py'
      }
    }
    stage('Beans test') {
      steps {
        sh 'python3 tools/beans_test.py'
      }
    }
    stage('Carl test') {
      steps {
        sh 'python3 tools/svin_test.py'
      }
    }
    stage('West items test') {
      steps {
        sh 'python3 tools/west_items_test.py'
      }
    }
    stage('Extra Allt test') {
      steps {
        sh 'python3 tools/extra_allt_test.py'
      }
    }
    stage('Targetless item test') {
      steps {
        sh 'python3 tools/targetless_test.py'
      }
    }
    stage('Weiron test') {
      steps {
        sh 'python3 tools/weiron_test.py'
      }
    }
    stage('Bodil test') {
      steps {
        sh 'python3 tools/bodil_test.py'
      }
    }
    stage('West and bonus tracks test') {
      steps {
        sh 'python3 tools/vastgota_test.py'
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
    stage('Menu fit test') {
      steps {
        sh 'python3 tools/menu_fit_test.py'
      }
    }
  }
  post {
    always { archiveArtifacts artifacts: 'smoke.png,sig-*.png,beans-*.png,west-*.png,weiron-*.png,bodil-*.png', allowEmptyArchive: true }
  }
}
