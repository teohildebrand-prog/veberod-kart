# A local Jenkins for the game's pipeline: the Docker CLI (the pipeline builds and runs
# tools/ci/Dockerfile on the host's Docker), the plugins it needs, and the job set up by casc.yaml.
FROM jenkins/jenkins:2.580.1-lts-jdk21
COPY --from=docker:28-cli /usr/local/bin/docker /usr/local/bin/docker
COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt
COPY casc.yaml /usr/share/jenkins/ref/casc.yaml
ENV CASC_JENKINS_CONFIG=/usr/share/jenkins/ref/casc.yaml \
    JAVA_OPTS=-Djenkins.install.runSetupWizard=false
