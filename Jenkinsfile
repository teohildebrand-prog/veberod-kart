// Smoke test: load the game headless, start a race, fail on any JS error.
pipeline {
  agent {
    docker { image 'mcr.microsoft.com/playwright/python:v1.49.0-noble' }
  }
  options { timeout(time: 60, unit: 'MINUTES') }   // six west tracks raced twice each, every stage's fuel audited, six tracks' rubber band
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
    stage('Signature mode test') {
      steps {
        sh 'python3 tools/sigmode_test.py'
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
    stage('Boss items test') {
      steps {
        sh 'python3 tools/boss_items_test.py'
      }
    }
    stage('Bodil test') {
      steps {
        sh 'python3 tools/bodil_test.py'
      }
    }
    stage('Bodils promenad test') {
      steps {
        sh 'python3 tools/promenad_test.py'
      }
    }
    stage('West and bonus tracks test') {
      steps {
        sh 'python3 tools/vastgota_test.py'
      }
    }
    stage('Rubber band audit') {
      steps {
        sh 'python3 tools/band_audit.py --json band-audit.json'
      }
    }
    stage('Fuel audit') {
      steps {
        sh 'python3 tools/fuel_audit.py --json fuel-audit.json'
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
    stage('Race flow test') {
      steps {
        sh 'python3 tools/race_flow_test.py'
      }
    }
  }
  post {
    always { archiveArtifacts artifacts: 'fuel-audit.json,band-audit.json,smoke.png,sig-*.png,beans-*.png,west-*.png,weiron-*.png,bodil-*.png,boss-*.png', allowEmptyArchive: true }
  }
}
