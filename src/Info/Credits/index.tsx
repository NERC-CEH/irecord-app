import { Page, Main, Header, Section } from '@flumens';
import ercissLogo from './cwt-erccis.png';
import './styles.scss';

const { P, H } = Section;

export default () => (
  <Page id="credits">
    <Header title="Credits" />
    <Main>
      <img src={ercissLogo} alt="Cornwall Wildlife Trust erccis Logo" />

      <Section>
        <H>
          We are very grateful for all the people that have helped to develop
          and test the ORKS App:
        </H>
        <P skipTranslation className="credits">
          <span>
            <b>Richard Frost</b>
          </span>
          <span>
            <b>ERCCIS Staff (past and present!)</b>
          </span>
          <span>
            <b>ERCCIS Volunteers (past and present!)</b>
          </span>
          <span>
            <b>
              A special thank you to Niki, Laura 1, Laura 2, Amity, Josh, Nic,
              Gary, John, Jenny, Alan and Stuart.
            </b>
          </span>
        </P>
      </Section>

      <Section>
        <P>
          This app was funded by <a href="https://www.erccis.org.uk/">ERCCIS</a>
        </P>
      </Section>

      <Section>
        <P skipTranslation className="credits">
          Many thanks to the photographers for the use of their images in the
          welcome screen gallery.
        </P>
      </Section>

      <Section>
        <H>Icons were made by</H>
        <P skipTranslation className="credits">
          <a
            href="https://www.flaticon.com/authors/nhor-phai"
            title="Nhor Phai"
          >
            Nhor Phai
          </a>
          ,{' '}
          <a href="https://www.flaticon.com/authors/freepik" title="Freepik">
            Freepik
          </a>{' '}
          from{' '}
          <a href="https://www.flaticon.com/" title="Flaticon">
            www.flaticon.com
          </a>
        </P>
      </Section>
    </Main>
  </Page>
);
