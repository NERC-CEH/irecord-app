<ul class="table-view core inputs no-top <%- obj.isSynchronising ? 'disabled' : '' %>">
  <li class="table-view-cell">
    <a id="species-button" class="navigate-right">
      <% if (obj.commonName) { %>
      <span class="media-object pull-right descript long"><%- obj.commonName %></span>
      <% } %>
      <span class="media-object pull-right descript long"><i><%- obj.scientificName %></i></span>
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#surveys/<%- obj.surveySampleID %>/edit/samples/<%- obj.id %>/edit/location"
       id="location-button"
       class="<%- obj.locks['location'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-location"></span>

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
    <a href="#surveys/<%- obj.surveySampleID %>/edit/samples/<%- obj.id %>/edit/stage" id="comment-button"
       class="<%- obj.locks['stage'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-stage"></span>
      <span class="media-object pull-right descript"><%= obj.stage %></span>
      Stage
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#surveys/<%- obj.surveySampleID %>/edit/samples/<%- obj.id %>/edit/abundance" id="comment-button"
       class="<%- obj.locks['abundance'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-number"></span>
      <span class="media-object pull-right descript"><%= obj.abundance %></span>
      Abundance
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#surveys/<%- obj.surveySampleID %>/edit/samples/<%- obj.id %>/edit/status" id="comment-button"
       class="<%- obj.locks['status'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-edit"></span>
      <span class="media-object pull-right descript"><%= obj.status %></span>
      Status
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#surveys/<%- obj.surveySampleID %>/edit/samples/<%- obj.id %>/edit/identifiers" id="comment-button"
       class="<%- obj.locks['identifiers'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-user-plus"></span>
      <span class="media-object pull-right descript"><%= obj.identifiers %></span>
      Determiner
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#surveys/<%- obj.surveySampleID %>/edit/samples/<%- obj.id %>/edit/comment" id="comment-button"
       class="<%- obj.locks['comment'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-comment"></span>
      <span class="media-object pull-right descript"><%= obj.comment %></span>
      Comment
    </a>
  </li>
  <li id="sensitive-btn-parent" class="table-view-cell">
    <a>
      Sensitive
      <span class="media-object pull-left icon icon-location toggle-icon"></span>
      <div id="sensitive-btn" data-setting="sensitive"
           class="toggle no-yes <%- obj.sensitive ? 'active' : '' %>">
        <div class="toggle-handle"></div>
      </div>
    </a>
  </li>
</ul>
