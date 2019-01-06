<ion-list class="<%- obj.isSynchronising ? 'disabled' : '' %>" lines="full" >
  <ion-item id="species-button" detail>
    <ion-label>
      <% if (obj.commonName || obj.scientificName) { %>
        <% if (obj.commonName) { %>
        <span slot="end" class="descript long"><%= obj.commonName %></span>
        <% } %>
        <span slot="end" class="descript long"><i><%= obj.scientificName %></i></span>
      <% } else { %>
      <span slot="end" class="descript error">Species missing</span>
      <% } %>
      </ion-label>
  </ion-item>
  <ion-item id="location-button" class="<%- obj.locationEditAllowed ? '' : 'disabled' %>" detail>
      <span slot="start" slot="start" class="icon icon-location"></span>
      <% if (obj.locationEditAllowed) { %>
          <% if (obj.isLocating) { %>
            <span slot="end" class="descript warn">Locating...</span>
          <% } else { %>
            <span slot="end" class="descript"><%= obj.location %></span>
          <% } %>
      <% } else { %>
      <span slot="end" class="descript error">No list location</span>
      <% } %>

    Location
  </ion-item>
  <ion-item href="#surveys/<%- obj.surveySampleID %>/edit/samples/<%- obj.id %>/edit/status" detail>
      <span slot="start" class="icon icon-edit"></span>
      <span slot="end" class="descript"><%= obj.status %></span>
      Status
  </ion-item>
  <ion-item href="#surveys/<%- obj.surveySampleID %>/edit/samples/<%- obj.id %>/edit/stage" detail>
      <span slot="start" class="icon icon-stage"></span>
      <span slot="end" class="descript"><%= obj.stage %></span>
      Stage
  </ion-item>
  <ion-item href="#surveys/<%- obj.surveySampleID %>/edit/samples/<%- obj.id %>/edit/abundance" detail>
      <span slot="start" class="icon icon-number"></span>
      <span slot="end" class="descript"><%= obj.abundance %></span>
      Abundance
  </ion-item>
  <ion-item href="#surveys/<%- obj.surveySampleID %>/edit/samples/<%- obj.id %>/edit/identifiers" detail>
      <span slot="start" class="icon icon-user-plus"></span>
      <span slot="end" class="descript"><%= obj.identifiers %></span>
      Determiner
  </ion-item>
  <ion-item href="#surveys/<%- obj.surveySampleID %>/edit/samples/<%- obj.id %>/edit/comment" detail>
      <span slot="start" class="icon icon-comment"></span>
      <span slot="end" class="descript"><%= obj.comment %></span>
      Comment
  </ion-item>
  <ion-item>
    <span slot="start" class="icon icon-low-vision"></span>
    <ion-label>Sensitive</ion-label>
    <ion-toggle slot="end" id="sensitive-btn"
                value="sensitive-btn"
    <%- obj.sensitive ? 'checked' : '' %>>
    </ion-toggle>
  </ion-item>
</ion-list>
