<div class="info-message">
  <p>Please sign in with your iRecord account or register.</p>
</div>
<div class="input-group">
  <div class="input-row">
    <label class="media-object pull-left icon icon-user"></label>
    <input id="user-name" name="name" type="email" placeholder="Username or email">
  </div>
  <div class="input-row">
    <label class="media-object pull-left icon icon-key"></label>
    <input id="user-password" name="password" type="password" placeholder="Password">
  </div>
</div>
<button id="login-button" class="btn btn-narrow btn-positive btn-block">Sign in</button>

<ul class="table-view space-top">
  <li class="table-view-cell">
    <a href="<%= obj.siteUrl %>user/register" class="navigate-right" target="_blank">
      <span class="media-object pull-left icon icon-user-plus"></span>
      Create new account
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#user/reset" class="navigate-right">
      <span class="media-object pull-left icon icon-key"></span>
      Request a new password
    </a>
  </li>
</ul>