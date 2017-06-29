<div class="pull-left">
  <a href="#info" class="menu-link icon icon-menu"></a>
  <button id="surveys-btn" class="icon icon-surveys on"></button>
  <a href="#user/activities" id="activities-btn" class="icon icon-users disabled very"></a>
</div>
<div class="pull-right">
  <div class="img-picker icon icon-camera disabled very"></div>
  <button id="create-new-btn" class="icon icon-plus"></button>
</div>

<div id="subheader">
  <div class="surveys">
    Lists
    <div id="toggle"></div>
  </div>

  <% if (obj.training) { %>
  <div class="training">Training</div>
  <% } %>
</div>
