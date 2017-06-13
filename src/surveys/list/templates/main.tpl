<div class="main-header surveys">
  Surveys

  <div id="atlas-toggle">
    Atlas
    <div id="use-atlas-btn" data-setting="useAtlas" class="toggle no-yes <%- obj.useAtlas ? 'active' : '' %>">
      <div class="toggle-handle"></div>
    </div>
  </div>
</div>

<% if (obj.useTraining) { %>
<div class="main-header training">training mode</div>
<% } %>

<ul id="list" class="table-view no-top"></ul>
