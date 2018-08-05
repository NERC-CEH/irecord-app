<div class="input-group form">
  <div class="input-row">
    <label class="media-object pull-left icon icon-mail"></label>
    <input id="user-email" type="text" placeholder='<%= t("Email") %>'
           name="email">
  </div>
  <div class="input-row">
    <label class="media-object pull-left icon icon-user"></label>
    <input id="user-firstname" type="text" placeholder='<%= t("First Name") %>'
           name="firstname">
  </div>
  <div class="input-row">
    <label class="media-object pull-left icon icon-user"></label>
    <input id="user-secondname" type="text" placeholder='<%= t("Surname") %>'
           name="secondname">
  </div>
  <div class="input-row">
    <label class="media-object pull-left icon icon-key"></label>
    <input id="user-password" type="password" placeholder='<%= t("Password") %>'
           name="password">
  </div>
  <div class="input-row">
    <label class="media-object pull-left icon icon-key"></label>
    <input id="user-password-confirm" type="password"
           placeholder='<%= t("Confirm password") %>' name="password-confirm">
  </div>
</div>


<ion-item>
  <ion-label><%= t("I agree to") %>
    <a href="#info/terms" style="display: inline; color: #91a71c;">
      <%= t("Terms and Conditions") %>
    </a>
  </ion-label>

  <ion-toggle slot="end" id="user-terms-agree"></ion-toggle>
</ion-item>

<ion-button id="register-button"><%= t("Create") %></ion-button>
