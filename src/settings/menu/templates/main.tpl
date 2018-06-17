<li class="table-view-divider"><%= t("Records") %></li>
<li class="table-view-cell">
  <a id="submit-all-btn">
    <span class="media-object pull-left icon icon-send"></span>
    <%= t("Submit All") %>
  </a>
</li>
<li class="table-view-cell">
  <a id="delete-all-btn">
    <span class="media-object pull-left icon icon-delete"></span>
    <%= t("Remove All Saved") %>
  </a>
</li>
<li id="use-training-btn-parent" class="table-view-cell">
  <%= t("Training Mode") %>
  <span class="media-object pull-left icon icon-training"></span>
  <div id="use-training-btn" data-setting="useTraining"
       class="toggle no-yes <%- obj.useTraining ? 'active' : '' %>">
    <div class="toggle-handle"></div>
  </div>
</li>

<li class="table-view-divider"><%= t("Location") %></li>
<li class="table-view-cell">
  <%= t("Use Grid Ref") %>
  <span class="media-object pull-left icon icon-grid"></span>
  <div id="use-gridref-btn" data-setting="useGridRef" class="toggle no-yes <%- obj.useGridRef ? 'active' : '' %>">
    <div class="toggle-handle"></div>
  </div>
</li>
<li id="use-gridmap-btn-parent" class="table-view-cell  <%- obj.useGridRef ? '' : 'disabled' %>">
  <%= t("Show Map Grid") %>
  <span class="media-object pull-left icon icon-grid"></span>
  <div id="use-gridmap-btn" data-setting="useGridMap"
       class="toggle no-yes <%- obj.useGridMap ? 'active' : '' %>">
    <div class="toggle-handle"></div>
  </div>
</li>
<li class="table-view-cell">
  <a href="#settings/locations" class="navigate-right">
    <span class="media-object pull-left icon icon-location"></span>
    <%= t("Manage Saved") %>
  </a>
</li>
<li class="table-view-cell">
  <a href="#settings/survey" class="navigate-right">
    <span class="media-object pull-left icon icon-grid"></span>
    <span class="media-object pull-right descript" style="width: 25%;"><%= obj.gridSquareUnit %></span>
    Grid Square Unit
  </a>
</li>

<li class="table-view-divider"><%= t("Application") %></li>
<li class="table-view-cell">
  <%= t("Experimental Features") %>
  <span class="media-object pull-left icon icon-fire"></span>
  <div id="use-experiments-btn" data-setting="useExperiments" class="toggle no-yes <%- obj.useExperiments ? 'active' : '' %>">
    <div class="toggle-handle"></div>
  </div>
</li>
<li class="table-view-cell">
  <a id="app-reset-btn">
    <span class="media-object pull-left icon icon-undo"></span>
    <%= t("Reset") %>
  </a>
</li>
