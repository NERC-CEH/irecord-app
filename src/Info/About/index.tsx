import { Page, Main, Header, Section } from '@flumens';
import './styles.scss';

const { P, H } = Section;

const About = () => (
  <Page id="about">
    <Header title="About" />
    <Main id="about">
      <Section>
        <P>
          Sam testing iRecord App which is an application that enables you to get involved in
          biological recording. You can contribute your sightings with photos,
          GPS acquired coordinates, descriptions and other information, thus
          providing scientists with important new biodiversity information that
          contributes to nature conservation, planning, research and education.'
        </P>
      </Section>

      <Section>
        <H>Who can use the app?</H>
        <P>
          We encourage everyone to get involved with recording species as it is
          very easy and quick to submit useful records without specialist
          knowledge. It doesn&apos;t matter whether you are an amateur
          enthusiast or a qualified biologist, iRecord App is for anyone who
          wants to contribute to our database observations of the natural
          environment.'
        </P>
      </Section>

      <Section>
        <H>App Development</H>
        <P>
          This app was hand crafted with love by
          <a href="https://flumens.io" style={{ whiteSpace: 'nowrap' }}>
            {' '}
            Flumens.
          </a>{' '}
          Agency specializing in building bespoke data oriented sollutions. For
          suggestions and feedback please do not hesitate to{' '}
          <a href="mailto:apps%40ceh.ac.uk?subject=iRecord%20App">contact us</a>
          .
        </P>
      </Section>
    </Main>
  </Page>
);

export default About;
