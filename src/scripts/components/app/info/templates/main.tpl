<ul class="table-view">
  <li class="table-view-cell">
    <a href="#app/about" class="navigate-right">About</a>
  </li>
  <li class="table-view-cell">
    <a href="#app/privacy" class="navigate-right">Privacy Policy</a>
  </li>
  <li class="table-view-cell">
    <a href="#app/brc-approved" class="navigate-right">BRC Approved</a>
  </li>
  <li class="table-view-cell">
    <a href="#app/credits" class="navigate-right">Credits</a>
  </li>

  <li class="table-view-divider">Settings</li>
  <li class="table-view-cell">
    <a href="#app/settings" class="navigate-right">App</a>
  </li>

  <li class="table-view-divider">Account</li>
  <% if (obj.surname) { %>
  <li class="table-view-cell">
    <a id="logout-button" class="navigate-right">Logout: <%- obj.surname %></a>
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