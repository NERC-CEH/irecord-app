<ion-item-divider><%= t("Records") %></ion-item-divider>
<ion-item id="submit-all-btn">
  <span slot="start" class="icon icon-send"></span>
  <%= t("Submit All") %>
</ion-item>
<ion-item id="delete-all-btn">
  <span slot="start" class="icon icon-delete"></span>
  <%= t("Remove All Saved") %>
</ion-item>
<ion-item>
  <span slot="start" class="icon icon-training"></span>
  <ion-label><%= t("Training Mode") %></ion-label>
  <ion-toggle slot="end" id="use-training-btn"
              value="useTraining"
  <%- obj.useTraining ? 'checked' : '' %>>
  </ion-toggle>
</ion-item>

<ion-item-divider><%= t("Location") %></ion-item-divider>
<ion-item>
  <span slot="start" class="icon icon-grid"></span>
  <ion-label><%= t("Use Grid Ref") %></ion-label>
  <ion-toggle slot="end" id="use-gridref-btn"
              value="useGridRef"
  <%- obj.useGridRef ? 'checked' : '' %>>
  </ion-toggle>
</ion-item>
<ion-item>
  <span slot="start" class="icon icon-grid"></span>
  <ion-label><%= t("Show Map Grid") %></ion-label>
  <ion-toggle slot="end" id="use-gridref-btn"
              value="useGridMap"
  <%- obj.useGridRef ? '' : 'disabled' %>
  <%- obj.useGridMap ? 'checked' : '' %>>
  </ion-toggle>
</ion-item>
<ion-item href="#settings/locations" detail>
  <span slot="start" class="icon icon-location"></span>
  <%= t("Manage Saved") %>
</ion-item>
<ion-item href="#settings/survey" detail>
  <span slot="start" class="icon icon-grid"></span>
  <span slot="end" class="descript" style="width: 25%;"><%= obj.gridSquareUnit %></span>
  Grid Square Unit
</ion-item>

<ion-item-divider><%= t("Application") %></ion-item-divider>
<ion-item>
    <span slot="start" class="icon icon-fire"></span>
  <ion-label><%= t("Experimental Features") %></ion-label>
  <ion-toggle slot="end" id="use-experiments-btn"
              value="useExperiments"
  <%- obj.useExperiments ? 'checked' : '' %>>
  </ion-toggle>
</ion-item>
<ion-item id="app-reset-btn">
  <span slot="start" class="icon icon-undo"></span>
  <%= t("Reset") %>
</ion-item>
