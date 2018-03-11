<div class="pull-left">
  <a href="#info" class="menu-link icon icon-menu"></a>
  <button id="surveys-btn" class="icon icon-surveys"></button>
  <a href="#user/activities" id="activities-btn" class="icon icon-users <%- obj.activity_title ? 'on' : '' %>"></a>
</div>
<div class="pull-right">
  <div class="img-picker icon icon-camera">
    <input type="file" accept="image/*"/>
  </div>
  <button id="create-new-btn" class="icon icon-plus"></button>
</div>

<%  if(obj.activity_title || obj.training) { %>
<div id="subheader">
  <% if (obj.activity_title) { %>
  <div class="activity"><%- obj.activity_title %></div>
  <% } %>
  <% if (obj.training) { %>
  <div class="training">Training</div>
  <% } %>
</div>
<% } %>
