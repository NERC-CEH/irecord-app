import React from 'react';
import './sponsor_logo.png';

export default () => (
  <ul className="table-view">
    <li>
      <img src="images/sponsor_logo.png" alt="" />
    </li>
    <li>
      <p>
        <strong>
          We are very grateful for all the people that helped to create this
          app:
        </strong>
      </p>
      <p>
        <ul style={{ listStyleType: 'none' }}>
          <li><a href="https://www.ceh.ac.uk/staff/david-roy">David Roy (CEH)</a></li>
          <li><a href="https://kazlauskis.com">Karolis Kazlauskis</a></li>
          <li><a href="http://www.biodiverseit.co.uk">John van Breda (Biodiverse IT)</a></li>
          <li>Tom Humphrey (BSBI)</li>
          <li>Martin Harvey (CEH)</li>
          <li>Sally Rankin</li>
          <li>Colin Harrower (CEH)</li>
          <li>Tom August (CEH)</li>
          <li>Chris Raper (NHM)</li>
          <li>Charles Roper (FSC)</li>
          <li>Matt Smith</li>
          <li>Alan Rowland</li>
          <li>David Genney</li>
          <li>Graham Checkley</li>
        </ul>
      </p>
      <p>
        This app was part-funded by the{' '}
        <a href="https://www.ceh.ac.uk/">Centre for Ecology & Hydrology</a>/<a href="http://jncc.defra.gov.uk/">
          Joint Nature Conservation Committee
        </a>{' '}
        partnership supporting BRC.
      </p>
      <p>
        <strong>Welcome screen credits:</strong>
      </p>
      <ul style={{ listStyleType: 'none' }}>
        <li>David Kitching</li>
        <li>Nadine Mitschunas</li>
        <li>UK Ladybird Survey</li>
      </ul>
    </li>
  </ul>
);
