<ul class="table-view core inputs no-top <%- obj.isSynchronising ? 'disabled' : '' %>">
  <li class="table-view-cell">
    <a id="species-button" class="navigate-right">
      <% if (obj.commonName) { %>
      <span class="media-object pull-right descript long"><%= obj.commonName %></span>
      <% } %>
      <span class="media-object pull-right descript long"><i><%= obj.scientificName %></i></span>
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/location" id="location-button"
       class="<%- obj.locks['smp:location'] || obj.locks['smp:locationName'] ? '' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-location"></span>

      <% if (obj['smp:location']) { %>
      <span class="location media-object pull-right descript <%- obj.locks['smp:location'] ? 'lock' : '' %>"><%- obj['smp:location'] %></span>
      <% } else { %>
      <% if (obj.isLocating) { %>
      <span class="media-object pull-right descript warn">Locating...</span>
      <% } else { %>
      <span class="media-object pull-right descript error">Location missing</span>
      <% } %>
      <% } %>

      <% if (obj['smp:locationName']) { %>
      <span class="media-object pull-right descript <%- obj.locks['smp:locationName'] ? 'lock' : '' %>"><%= obj['smp:locationName'] %></span>
      <% } else { %>
      <span class="media-object pull-right descript error">Name missing</span>
      <% } %>

      Location
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/smp:date" id="date-button"
       class="<%- obj.locks['smp:date'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-calendar"></span>
      <span class="media-object pull-right descript"><%- obj['smp:date'] %></span>
      Date
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/occ:comment" id="comment-button"
       class="<%- obj.locks['occ:comment'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-comment"></span>
      <span class="media-object pull-right descript"><%- obj['occ:comment'] %></span>
      Comment
    </a>
  </li>
  <% if (obj['smp:activity']) { %>
      <li class="table-view-cell">
        <a href="#samples/<%- obj.id %>/edit/smp:activity" id="activity-button"
           class="<%- obj.locks['smp:activity'] ? 'lock' : 'navigate-right' %>">
          <span class="media-object pull-left icon icon-users"></span>
          <span class="media-object pull-right descript"><%- obj['smp:activity'] %></span>
          Activity
        </a>
      </li>
  <% } %>
</ul>

<ul id="attrs"></ul>
