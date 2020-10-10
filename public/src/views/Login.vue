<template>
  <b-container fluid="true">
    <b-row>
      <b-col offset-md="2" md="8" offset-lg="4" lg="4" class="px-0">
        <login-form />
      </b-col>
    </b-row>
  </b-container>
</template>
<script>
    import LoginForm from "../components/LoginForm.vue";

    export default {
        components: {
            LoginForm
        }
    };
</script>
