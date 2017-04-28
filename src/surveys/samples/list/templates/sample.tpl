<a href="#surveys/<%- obj.surveySampleID %>/edit/samples/<%- obj.id %>/edit" class="mobile">
  <div class="media-object pull-left photo"><%= obj.img %></div>
  <div class="media-body">
    <div class="species"> <%= obj.taxon %></div>
    <div class="core">
      @

      <% if (obj.location) { %>
      <% if (obj.location_name) { %>
      <span class="location"><%= obj.location_name %></span>
      <%  } else { %>
      <span class="location error">No location name</span>
      <% } %>
      <% } else { %>
      <% if (obj.isLocating) { %>
      <span class="location warn">Locating...</span>
      <% } else { %>
      <span class="location error">No location</span>
      <% } %>
      <% } %>
    </div>

    <div class="attributes">
      <div class="comment"><%= obj.comment %></div>
    </div>
  </div>
</a>

<div class="mobile-swipe-edit">
  <div id="delete" class="delete icon icon-delete"></div>
</div>