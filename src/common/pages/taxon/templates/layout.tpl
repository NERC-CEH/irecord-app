<ion-searchbar id="taxon" placeholder='<%= t("Species name") %>' autocorrect="off" autocomplete="off" animated="true" debounce="300"></ion-searchbar>

<div id="suggestions">
  <p id="taxa-shortcuts-info"><%= t("For quicker searching of the taxa you can use different shortcuts. For example, to find") %> <i>Puffinus baroli</i> <%= t("you can type in the search bar") %>:
    <br>
    <br><i>puffinus ba</i>
    <br><i>puffinus .oli</i>
    <br><i>. baroli</i>
  </p>
</div>
