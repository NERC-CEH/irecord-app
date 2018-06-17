<% if (obj.locked) { %>
  <a id="lock-btn" class="icon icon-lock-closed"><%= t("Locked") %></a>
<% } else { %>
  <a id="lock-btn" class="icon icon-lock-open"><%= t("Unlocked") %></a>
<% } %>
