<a href="#surveys/<%- obj.id %><%- obj.onDatabase ? '' : '/edit' %>" class="mobile">
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
      <span class="survey-label"><%= obj.surveyLabel %></span>

      <div class="core">
        <% if (obj.date) { %>
        <span class="date"><%= obj.date %></span>
        <% } else { %>
        <span class="date error">Date</span>
        <% } %>

        @

        <% if (obj.location) { %>
          <% if (obj.locationName) { %>
          <span class="location"><%= obj.location %></span>
          <span class="location">(<%= obj.locationName %>)</span>
          <%  } else { %>
          <span class="location"><%= obj.location %></span>
          <span class="location error">(No name)</span>
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
        <div class="samples">Species: <b><%= obj.samples %></b></div>
        <div class="comment"><%= obj.comment %></div>
      </div>
    </div>
  </a>

  <div class="mobile-swipe-edit">
    <div id="delete" class="delete icon icon-delete"></div>
  </div>
