<div class="info-message">
  <p><%= t("Enter your username or email address to request a password reset") %>.</p>
</div>
<div class="input-group">
  <div class="input-row">
    <label class="media-object pull-left icon icon-user"></label>
    <input id="user-name" name="name" type="email" placeholder='<%= t("Username or email") %>'>
  </div>
</div>
<ion-button id="reset-button"><%= t("Request") %></ion-button>
