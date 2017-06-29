<div class="pull-left">
  <a href="#info" class="menu-link icon icon-menu"></a>
  <button id="surveys-btn" class="icon icon-surveys" style="<%- obj.useExperiments ? '': 'display:none' %>"></button>
  <a href="#user/activities" id="activities-btn" class="icon icon-users <%- obj.group_title ? 'on' : '' %>"></a>
</div>
<div class="pull-right">
  <div class="img-picker icon icon-camera">
    <input type="file" accept="image/*"/>
  </div>
  <button id="create-new-btn" class="icon icon-plus"></button>
</div>

<%  if(obj.group_title || obj.training) { %>
<div id="subheader">
  <% if (obj.group_title) { %>
  <div class="activity"><%- obj.group_title %></div>
  <% } %>
  <% if (obj.training) { %>
  <div class="training">Training</div>
  <% } %>
</div>
<% } %>