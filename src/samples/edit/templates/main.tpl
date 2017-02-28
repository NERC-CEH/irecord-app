<% if (obj.group) { %>
<div class="main-header activity"></div>
<% } %>
<% if (obj.training) { %>
<div class="main-header training"></div>
<% } %>

<ul class="table-view core inputs no-top <%- obj.isSynchronising ? 'disabled' : '' %>">
  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/taxon" id="species-button" class="navigate-right">
      <% if (obj.commonName) { %>
      <span class="media-object pull-right descript"><%- obj.commonName %></span>
      <% } %>
      <span class="media-object pull-right descript"><i><%- obj.scientificName %></i></span>
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/location" id="location-button"
       class="<%- obj.locks['location'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-location"></span>

      <% if (obj.location_name) { %>
      <span class="media-object pull-right descript"><%= obj.location_name %></span>
      <% } else { %>
      <span class="media-object pull-right descript error">Name missing</span>
      <% } %>

      <% if (obj.location) { %>
      <span class="media-object pull-right descript"><%- obj.location %></span>
      <% } else { %>
      <% if (obj.isLocating) { %>
      <span class="media-object pull-right descript warn">Locating...</span>
      <% } else { %>
      <span class="media-object pull-right descript error">Location missing</span>
      <% } %>
      <% } %>
      Location
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/date" id="date-button"
       class="<%- obj.locks['date'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-calendar"></span>
      <span class="media-object pull-right descript"><%- obj.date %></span>
      Date
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/number" id="number-button"
       class="<%- obj.locks['number'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-number"></span>
      <span class="media-object pull-right descript"><%- obj.number %></span>
      Number
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/stage" id="stage-button"
       class="<%- obj.locks['stage'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-stage"></span>
      <span class="media-object pull-right descript"><%- obj.stage %></span>
      Stage
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/comment" id="comment-button"
       class="<%- obj.locks['comment'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-comment"></span>
      <span class="media-object pull-right descript"><%= obj.comment %></span>
      Comment
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/identifiers" id="identifiers-button"
       class="<%- obj.locks['identifiers'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-user-plus"></span>
      <span class="media-object pull-right descript"><%= obj.identifiers %></span>
      Identifiers
    </a>
  </li>
  <% if (obj.group_title) { %>
  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/activity" id="activity-button"
       class="<%- obj.locks['activity'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-users"></span>
      <span class="media-object pull-right descript"><%- obj.group_title %></span>
      Activity
    </a>
  </li>
  <% } %>
</ul>
