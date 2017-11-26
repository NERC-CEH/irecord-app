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
