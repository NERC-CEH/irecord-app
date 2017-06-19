<div class="main-header surveys">
  Lists

  <div id="atlas-toggle">
    Grid alert
    <div id="use-atlas-btn" data-setting="useAtlas" class="toggle on-off <%- obj.useAtlas ? 'active' : '' %>">
      <div class="toggle-handle"></div>
    </div>
  </div>
</div>

<% if (obj.useTraining) { %>
<div class="main-header training">Training</div>
<% } %>

<ul id="list" class="table-view no-top"></ul>
