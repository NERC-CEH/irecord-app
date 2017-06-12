<% if (obj.training) { %>
<div class="main-header training"></div>
<% } %>

<ul class="table-view core inputs no-top <%- obj.isSynchronising ? 'disabled' : '' %>">
  <li class="table-view-cell">
    <a id="location-button" class="navigate-right">
      <span class="media-object pull-left icon icon-location"></span>

      <% if (obj.locationName) { %>
      <span class="media-object pull-right descript"><%= obj.locationName %></span>
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
    <a href="#surveys/<%- obj.id %>/edit/vice-county" id="date-button"
       class="<%- obj.locks['vice-county'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-address"></span>
      <span class="media-object pull-right descript short"><%- obj['vice-county'] %></span>
      Vice County
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#surveys/<%- obj.id %>/edit/date" id="date-button"
       class="<%- obj.locks['date'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-calendar"></span>
      <span class="media-object pull-right descript"><%- obj.date %></span>
      Date
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#surveys/<%- obj.id %>/edit/samples" id="stage-button"
       class="<%- obj.locks['stage'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-stage"></span>
      <span class="media-object pull-right descript"><%- obj.species ? obj.species : '' %></span>
      Species
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#surveys/<%- obj.id %>/edit/recorders" id="stage-button"
       class="<%- obj.locks['stage'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-users"></span>
      <span class="media-object pull-right descript"><%- obj.recorders ? obj.recorders : '' %></span>
      Recorders
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#surveys/<%- obj.id %>/edit/comment" id="comment-button"
       class="<%- obj.locks['comment'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-comment"></span>
      <span class="media-object pull-right descript"><%= obj.comment %></span>
      Comment
    </a>
  </li>
 </ul>
