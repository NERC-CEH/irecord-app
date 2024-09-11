import { Trans as T } from 'react-i18next';
import { Page, Main, Header, Section } from '@flumens';
import sponsorsLogo from './sponsors.svg';
import './styles.scss';

const { P, H } = Section;

export default () => (
  <Page id="credits">
    <Header title="Credits" />
    <Main>
      <img src={sponsorsLogo} alt="" />

      <Section>
        <H>
          We are very grateful for all the people that helped to create this
          app:
        </H>
        <P skipTranslation className="credits">
          <span>
            <b>David Roy</b> (UKCEH)
          </span>
          <span>
            <b>Karolis Kazlauskis</b> (Flumens)
          </span>
          <span>
            <b>John van Breda</b> (Biodiverse IT)
          </span>
          <span>
            <b>Tom Humphrey</b> (BSBI)
          </span>
          <span>
            <b>Martin Harvey</b> (UKCEH)
          </span>
          <span>
            <b>Sally Rankin</b>
          </span>
          <span>
            <b>Colin Harrower</b> (UKCEH)
          </span>
          <span>
            <b>Tom August</b> (UKCEH)
          </span>
          <span>
            <b>Chris Raper</b> (NHM)
          </span>
          <span>
            <b>Charles Roper</b> (FSC)
          </span>
          <span>
            <b>Matt Smith</b>
          </span>
          <span>
            <b>Alan Rowland</b>
          </span>
          <span>
            <b>David Genney</b>
          </span>
          <span>
            <b>Graham Checkley</b>
          </span>
        </P>
      </Section>

      <Section>
        <P>
          This app was part-funded by the{' '}
          <a href="https://www.ceh.ac.uk/">UK Centre for Ecology & Hydrology</a>
          /
          <a href="http://jncc.defra.gov.uk/">
            Joint Nature Conservation Committee
          </a>{' '}
          partnership supporting BRC.
        </P>
      </Section>

      <Section>
        <H skipTranslation>
          <T>Welcome screen credits</T>:
        </H>
        <P skipTranslation className="credits">
          <span>David Kitching</span>
          <span>UK Ladybird Survey</span>
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
