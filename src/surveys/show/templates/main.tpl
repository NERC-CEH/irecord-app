<div class="info-message">
  <p>This record has been submitted and cannot be edited within this App.
    <ion-button id="record-external-link" color="light" href="<%= obj.site_url %>/enter-vascular-plants?sample_id=<%= obj.id %>">
      <ion-icon slot="end" name="exit"></ion-icon>
      View on iRecord
    </ion-button>
  </p>
</div>
<ul class="table-view core inputs info no-top">
  <li class="table-view-cell">
    <span class="media-object pull-left icon icon-location"></span>
    <span class="media-object pull-right descript"><%= obj.locationName %></span>
    <span class="media-object pull-right descript"><%= obj.location %></span>
    Location
  </li>
  <li class="table-view-cell">
    <span class="media-object pull-left icon icon-calendar"></span>
    <span class="media-object pull-right descript"><%= obj.date %></span>
    Date
  </li>
  <li class="table-view-cell">
    <span class="media-object pull-left icon icon-stage"></span>
    <span class="media-object pull-right descript"><%= obj.species %></span>
    Species
  </li>
  <li class="table-view-cell">
    <span class="media-object pull-left icon icon-users"></span>
    <span class="media-object pull-right descript"><%= obj.recorders %></span>
    Recorders
  </li>
  <% if (obj.comment) { %>
  <li class="table-view-cell">
    <span class="media-object pull-left icon icon-comment"></span>
    Comment
    <span class="comment descript"><%= obj.comment %></span>
  </li>
  <% } %>
</ul>

<div id="occurrence-id"><%- obj.cid %></div>
