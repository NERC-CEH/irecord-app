<ion-item href="#surveys/<%- obj.surveySampleID %>/edit/samples/<%- obj.id %>/edit">
  <div class="media-object photo"><%= obj.img %></div>
  <div class="media-body">
    <% if (obj.commonName || obj.scientificName) { %>
      <% if (obj.commonName) { %>
      <div class="species"> <%= obj.commonName %></div>
      <div class="species scientific"> <small><i><b><%= obj.scientificName %></b></i></small></div>
      <% } else { %>
      <div class="species"> <i><b><%= obj.scientificName %></b></i></div>
      <% } %>
    <% } else { %>
    <div class="species error">Species missing</div>
    <% } %>
    <div class="core">
      <% if (obj.location) { %>
        @

        <% if (obj.locationName) { %>
        <span class="location"><%= obj.locationName %></span>
        <%  } else { %>
        <span class="location"><%= obj.location %></span>
        <% } %>
      <% } else { %>
        <% if (obj.isLocating) { %>
        @

        <span class="location warn">Locating...</span>
        <% } %>
      <% } %>
    </div>

    <% if (!obj.location && !obj.isLocating) { %>
      <div class="attributes sample-attributes">
        <div class="status"><%= obj.status %></div>
        <% if (obj.stage) { %> <span class="icon icon-stage"></span> <% } %>
        <% if (obj.abundance) { %> <span class="icon icon-number"></span> <% } %>
        <% if (obj.comment) { %> <span class="icon icon-comment"></span> <% } %>
        <% if (obj.identifiers) { %> <span class="icon icon-user-plus"></span> <% } %>
        <% if (obj.sensitive) { %> <span class="icon icon-low-vision"></span> <% } %>
      </div>
    <% } %>

  </div>
</ion-item>

<ion-item-options side="end">
  <ion-item-option id="delete" color="danger">
    <div class="edit icon icon-delete"></div>
  </ion-item-option>
</ion-item-options>

