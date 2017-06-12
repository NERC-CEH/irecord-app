<div class="pull-left">
  <a href="#info" class="menu-link icon icon-menu"></a>
  <button id="surveys-btn" class="icon icon-surveys" style="<%- obj.useExperiments ? '': 'display:none' %>"></button>
  <a href="#user/activities" id="activities-btn" class="icon icon-users <%- obj.activityOn ? 'on' : '' %>"></a>
</div>
<div class="pull-right">
  <div class="img-picker icon icon-camera">
    <input type="file" accept="image/*"/>
  </div>
  <button id="create-new-btn" class="icon icon-plus"></button>
</div>
