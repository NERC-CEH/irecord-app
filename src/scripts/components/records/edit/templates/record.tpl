<div id="core-inputs">
   <ul class="table-view">
     <li class="table-view-cell">
           <a href="#records/<%- obj.id %>/edit/taxon" id="species-button"
              class="navigate-right">
           <h3 class="heading">Species</h3>
               <p class="descript"><%- obj.occurrences[0].attributes.taxon %></p>
           </a>
         </li>
     <li class="table-view-cell">
      <a href="#records/<%- obj.id %>/edit/location" id="location-button"
         class="navigate-right">
      <h3 class="heading">Location</h3>
          <p class="descript"></p>
      </a>
    </li>
   <li class="table-view-cell">
      <a href="#records/<%- obj.id %>/edit/date" id="date-button"
         class="navigate-right">
      <h3 class="heading">Date</h3>
          <p class="descript"><%- obj.attributes.date %></p>
      </a>
    </li>
  </ul>
</div>

<div id="dynamic-inputs">
  <ul class="table-view">
     <li class="table-view-cell">
      <a href="#records/<%- obj.id %>/edit/number" id="number-button"
         class="navigate-right">
      <h3 class="heading">Number</h3>
          <p class="descript"></p>
      </a>
    </li>
   <li class="table-view-cell">
      <a href="#records/<%- obj.id %>/edit/stage" id="stage-button"
         class="navigate-right">
      <h3 class="heading">Stage</h3>
          <p class="descript"></p>
      </a>
    </li>
     <li class="table-view-cell">
          <a href="#records/<%- obj.id %>/edit/notes" id="notes-button"
             class="navigate-right">
          <h3 class="heading">Notes</h3>
              <p class="descript"></p>
          </a>
        </li>
  </ul>
</div>