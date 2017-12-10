<% if (obj.taxon) { %>
  <a
    <% if (!obj.isSynchronising) { %>
      href="#samples/<%- obj.id %><%- obj.onDatabase ? '' : '/edit' %>"
    <% } %>
    class="mobile">

  <% } else { %>
  <a id="add-species-btn" class="mobile">
    <% } %>
    <% if (obj.training) { %>
    <div class="media-object pull-left training"></div>
    <% } %>
    <% if (obj.group) { %>
    <div class="media-object pull-left group"></div>
    <% } %>
    <div class="media-object pull-left photo"><%= obj.img %></div>
    <div class="pull-right">
      <% if (obj.saved) { %>
      <% if (obj.isSynchronising) { %>
      <div class="online-status icon icon-plus spin"></div>
      <% } else { %>
      <div class="online-status icon icon-send <%- obj.onDatabase ? 'cloud' : 'local' %>"></div>
      <% } %>
      <% } %>
    </div>

    <div class="media-body">
      <% if (obj.taxon) { %>
      <div class="species"> <%= obj.taxon %></div>
      <% } else { %>
      <div class="species error">Species missing</div>
      <% } %>

      <div class="core">
        <% if (obj.date) { %>
        <span class="date"><%= obj.date %></span>
        <% } else { %>
        <span class="date error">Date</span>
        <% } %>

        @

        <% if (obj.location) { %>
          <% if (obj.locationName) { %>
          <span class="location"><%= obj.locationName %></span>
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
        <% if (obj.isDefaultSurvey) { %>
          <div class="number"><%= obj.number %></div>
          <div class="stage"><%= obj.stage %></div>
        <% } %>
        <div class="comment"><%= obj.comment %></div>
      </div>
    </div>
  </a>

  <div class="mobile-swipe-edit">
    <div id="delete" class="delete icon icon-delete"></div>
  </div>
