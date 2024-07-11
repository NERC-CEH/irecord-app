import { Page, Header, Main, Section } from '@flumens';
import { Trans as T } from 'react-i18next';
import brcLogo from './BRC_approved_logo.png';
import './styles.scss';

const { P, H } = Section;

export default () => (
  <Page id="brc-approved">
    <Header title="BRC Approved" />
    <Main id="brc-approved">
      <img src={brcLogo} className="brc-approved-logo" />

      <Section>
        <P>
          Wherever you see this logo on a biological recording app you can be
          assured that the data you submit will be: made available to experts
          for quality assurance; made available for conservation and research
          and preserved for long-term use.
        </P>
      </Section>

      <Section>
        <H skipTranslation>
          <T>This logo indicates that your data is</T>:
        </H>
        <P skipTranslation>
          <T>
            Sent to the Biological Record Centre’s data warehouse linked to the
            ORKS system where it accessible to you as the recorder, to an
            expert community of verifiers and other users of ORKS.
          </T>
        </P>
        <P skipTranslation>
          <T>
            Quality assured data is passed onto Local Environmental Records
            Centres, National Recording Schemes and to the NBN Atlas
          </T>
          .
        </P>
      </Section>

      <Section>
        <H>About BRC</H>

        <P>
          The{' '}
          <a href="http://www.brc.ac.uk" rel="external">
            Biological Records Centre
          </a>{' '}
          (BRC), established in 1964, is a national focus in the UK for
          terrestrial and freshwater species recording. BRC works closely with
          the voluntary recording community, principally through support of
          national recording schemes and societies. BRC is supported by the
          Joint Nature Conservation Committee (JNCC) and the UK Centre for
          Ecology & Hydrology (UKCEH). The work of BRC is a major component of
          the National Biodiversity Network (NBN).
        </P>
      </Section>

      <Section>
        <H>Which app should I use?</H>
        <P>
          You might have noticed that several of{' '}
          <a href="http://www.brc.ac.uk/apps" rel="external">
            BRC apps
          </a>{' '}
          feature some of the same species? We have introduced the BRC Approved
          logo to signify that data from our apps all go to the same place.
          Therefore, you are free to choose which app you use to record a given
          species. All records will be sent to the same place, treated in the
          same way and will meet the established standards required by the
          Biological Record Centre.
        </P>
      </Section>
    </Main>
  </Page>
);
