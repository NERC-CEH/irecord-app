import { Page, Main, Header, Section } from '@flumens';
import './styles.scss';

const { P, H } = Section;

const About = () => (
  <Page id="about">
    <Header title="About" />
    <Main id="about">
      <Section>
        <P>
        Sam testing The ORKS app is a mobile application which enables you to record
            wildlife sightings in Cornwall and Scilly on the go. You can log
            your sighting with details, photos, descriptions and other
            information, and upload this to the{' '}
            <a href="https://www.orks.org.uk">www.ORKS.org.uk</a> website.  
        </P>
        <P> 
        Your wildlife records are then available for conservation, sustainable planning, education and research work in Cornwall.
        </P>

        <P> 
        ORKS website and app are developed and supported by ERCCIS,
            Environmental Records Centre for Cornwall and the Isles of Scilly{' '}
            <a href="https://www.erccis.org.uk">www.erccis.org.uk</a>        
        </P>
        
      </Section>

      <Section>
        <H>Who can use the app?</H>
        <P>
        We encourage everyone and anyone to use this app, to record and submit your wildlife sightings while out enjoying the Cornish wild places.
        </P>
        <P>
        You don’t have to be an expert, this app is for anyone with an interest in wildlife and who want to do more to protect Cornwall’s Wildlife and Wild Places.
        </P>
      </Section>

      <Section>
        <H>How to use this app</H>
        <P>
        The ORKS app is linked to the Online Recording Kernow and Scilly
            website - <a href="https://www.orks.org.uk">www.ORKS.org.uk</a>.
            Your account and sightings submitted through the app can be viewed
            and managed through the ORKS website.
        </P>
        <P>
        Sign in or register an account on ORKS so you can submit your
            records:
         </P>
         <P>
            - Add species sightings by going to the &#34;+&#34; icon at the
            bottom of the app
         </P>
          <P>
            - Add all the details for the sightings, and photos from your device
            camera or gallery. The location of your sightings is obtained
            through your phone GPS but can be updated using the map.
          </P>
          <P>
            - Once your record is correct and you have added all the details you
            want it is ready to submit; click on the &#34;UPLOAD&#34; button to
            submit it to the ORKS website.
          </P>
      </Section>

      <Section>
      <H>App Development</H>
          <P>This app was developed using open source code for the iRecord app. Developed by ERCCIS and funding by the Alexanda Fund for Recorders.</P>
          <P>If you have any suggestions of feedback please contact{' '}
            <a href="mailto:orks%40cornwallwildlifetrust.org.uk?subject=ORKS%20App%20Support%20%26%20Feedback">
              ERCCIS
            </a>
          </P>
      </Section>


    </Main>
  </Page>
);

export default About;
