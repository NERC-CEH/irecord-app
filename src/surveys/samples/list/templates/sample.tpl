<a href="#surveys/<%- obj.surveySampleID %>/edit/samples/<%- obj.id %>/edit" class="mobile">
  <div class="media-object pull-left photo"><%= obj.img %></div>
  <div class="media-body">
    <% if (obj.commonName || obj.scientificName) { %>
      <% if (obj.commonName) { %>
      <div class="species"> <%= obj.commonName %></div>
      <div class="species scientific"> <small><i><%= obj.scientificName %></i></small></div>
      <% } else { %>
      <div class="species"> <i><%= obj.scientificName %></i></div>
      <% } %>
    <% } else { %>
    <div class="species error">Species missing</div>
    <% } %>
    <div class="core">
      <% if (obj.location) { %>
      @

      <% if (obj.location_name) { %>
      <span class="location"><%= obj.location_name %></span>
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

    <div class="attributes">
      <div class="stage"><%= obj.status %></div>
      <div class="comment"><%= obj.comment %></div>
    </div>
  </div>
</a>

<div class="mobile-swipe-edit">
  <div id="delete" class="delete icon icon-delete"></div>
</div>