<ion-list lines="full" class="core inputs no-top <%- obj.isSynchronising ? 'disabled' : '' %>">
  <ion-item id="species-button" detail>
    <ion-label text-wrap>
      <% if (obj.commonName) { %>
      <span class="descript long"><%= obj.commonName %></span>
      <% } %>
      <span class="descript long"><i><%= obj.scientificName %></i></span>
    </ion-label>

    </ion-item>
    <ion-item href="#samples/<%- obj.id %>/edit/location" id="location-button"
            detail detail-icon="<%- obj.locks['smp:location'] || obj.locks['smp:locationName'] ? 'lock' : 'ios-arrow-forward' %>">
      <span slot="start" class="icon icon-location"></span>

      <ion-label slot="end" text-wrap>
        <% if (obj['smp:location']) { %>
        <span slot="end" class="location long descript <%- obj.locks['smp:location'] ? 'lock' : '' %>"><%- obj['smp:location'] %></span>
        <% } else { %>
        <% if (obj.isLocating) { %>
        <span slot="end" class="descript long warn"><%= t("Locating") %>...</span>
        <% } else { %>
        <span slot="end" class="descript long error"><%= t("Location missing") %></span>
        <% } %>
        <% } %>

        <% if (obj['smp:locationName']) { %>
        <span slot="end" class="descript long <%- obj.locks['smp:locationName'] ? 'lock' : '' %>"><%= obj['smp:locationName'] %></span>
        <% } else { %>
        <span slot="end" class="descript long error"><%= t("Name missing") %></span>
        <% } %>
      </ion-label>

      <%= t("Location") %>
  </ion-item>
  <ion-item href="#samples/<%- obj.id %>/edit/smp:date" id="date-button"
            detail detail-icon="<%- obj.locks['smp:date'] ? 'lock' : 'ios-arrow-forward' %>">
      <span slot="start" class="icon icon-calendar"></span>
      <span slot="end" class="descript"><%- obj['smp:date'] %></span>
      <%= t("Date") %>
  </ion-item>
  <ion-item href="#samples/<%- obj.id %>/edit/occ:comment" id="comment-button"
            detail detail-icon="<%- obj.locks['occ:comment'] ? 'lock' : 'ios-arrow-forward' %>">
      <span slot="start" class="icon icon-comment"></span>
      <span slot="end" class="descript"><%- obj['occ:comment'] %></span>
      <%= t("Comment") %>
  </ion-item>
  <% if (obj['smp:activity']) { %>
    <ion-item href="#samples/<%- obj.id %>/edit/activity" id="activity-button"
              detail detail-icon="<%- obj.locks['smp:activity'] ? 'lock' : 'ios-arrow-forward' %>">
        <span slot="start" class="icon icon-users"></span>
        <span slot="end" class="descript"><%- obj['smp:activity'] %></span>
        <%= t("Activity") %>
    </ion-item>
  <% } %>
</ion-list>

<ion-list lines="full" id="attrs"></ion-list>
