<ul class="table-view">
  <li class="table-view-cell">
    <a class="navigate-right">About</a>
  </li>
  <li class="table-view-cell">
    <a class="navigate-right">Privacy Policy</a>
  </li>
  <li class="table-view-cell">
    <a class="navigate-right">BRC Approved</a>
  </li>
  <li class="table-view-cell">
    <a class="navigate-right">Credits</a>
  </li>

  <li class="table-view-divider">Settings</li>
  <li class="table-view-cell">
    <a class="navigate-right">App</a>
  </li>
  <li class="table-view-cell">
    <a class="navigate-right">User</a>
  </li>

  <li class="table-view-divider">Account</li>
  <% if (obj.user) { %>
  <li class="table-view-cell">
    <a id="logout-button" class="navigate-right">Logout: <%- obj.user %></a>
  </li>
  <% } else { %>
  <li class="table-view-cell">
    <a href="#user/login" class="navigate-right">Login</a>
  </li>
  <li class="table-view-cell">
    <a href="#user/register" class="navigate-right">Register</a>
  </li>
  <% } %>
</ul>