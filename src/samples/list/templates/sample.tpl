<% if (obj.taxon) { %>
  <a
    <% if (!obj.isSynchronising) { %>
      href="#samples/<%- obj.id %><%- obj.onDatabase ? '' : '/edit' %>"
    <% } %>
    class="mobile">

  <% } else { %>
  <a id="add-species-btn" class="mobile">
    <% } %>
    <% if (obj.activity) { %>
    <div class="media-object pull-left activity"></div>
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
      <div class="species error"><%= t("Species missing") %></div>
      <% } %>

      <div class="core">
        <% if (obj.date) { %>
        <span class="date <%= obj.dateLocked && 'locked' %>"><%= obj.date %></span>
        <% } else { %>
        <span class="date error"><%= t("Date") %></span>
        <% } %>

        @

        <% if (obj.location) { %>
          <% if (obj.locationName) { %>
          <span class="location <%= obj.locationLocked && 'locked' %>"><%= obj.locationName %></span>
          <%  } else { %>
            <span class="location error"><%= t("No location name") %></span>
          <% } %>
        <% } else { %>
          <% if (obj.isLocating) { %>
          <span class="location warn"><%= t("Locating") %>...</span>
          <% } else { %>
          <span class="location error"><%= t("No location") %></span>
          <% } %>
        <% } %>
      </div>

      <div class="attributes">
        <% if (obj.isDefaultSurvey) { %>
          <div class="number <%= obj.numberLocked && 'locked' %>"><%= obj.number %></div>
          <div class="stage <%= obj.stageLocked && 'locked' %>"><%= t(obj.stage) %></div>
        <% } %>
        <div class="comment <%= obj.commentLocked && 'locked' %>"><%= obj.comment %></div>
      </div>
    </div>
  </a>

  <div class="mobile-swipe-edit">
    <div id="delete" class="delete icon icon-delete"></div>
  </div>
