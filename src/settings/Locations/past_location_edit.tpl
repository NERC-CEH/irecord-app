<ion-list lines="full">
  <ion-item>
    <ion-input
      id="location-name"
      type="text"
      placeholder="Location Name"
      value="<%- obj.name %>"
    />
  </ion-item>
  <ion-item>
    <ion-label><%= t("Favourite") %></ion-label>
    <ion-toggle slot="end" id="favourite-btn" <%- obj.favourite ? 'checked' : '' %> />
  </ion-item>
</ion-list>

