<div class="input-row">
  <label class="item-input-wrapper pull-left">
    <span class="media-object pull-left icon icon-search"></span>
    <input id="taxon" type="search" placeholder='<%= t("Species name") %>' autocorrect="off" autocomplete="off" autofocus/>
  </label>
  <span class="delete media-object pull-right icon icon-cancel"></span>
</div>
<div id="suggestions">
  <p id="taxa-shortcuts-info"><%= t("For quicker searching of the taxa you can use different shortcuts. For example, to find") %> <i>Puffinus baroli</i> <%= t("you can type in the search bar") %>:
    <br>
    <br><i>puffinus ba</i>
    <br><i>puffinus .oli</i>
    <br><i>. baroli</i>
  </p>
</div>
