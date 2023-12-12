<script>
  import DefaultLayout from '$lib/pages/layouts/default-layout.svelte';
  import OnboardingTour from '$lib/pages/onboarding/onboarding-tour.svelte';
  import OnboardingWrapper from '$lib/pages/onboarding/onboarding-wrapper.svelte';
</script>

<DefaultLayout>
  <OnboardingWrapper>
    <OnboardingTour />
  </OnboardingWrapper>
</DefaultLayout>
