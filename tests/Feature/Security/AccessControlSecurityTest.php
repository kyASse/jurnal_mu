<?php

namespace Tests\Feature\Security;

use App\Http\Middleware\CheckJournalOwnership;
use App\Http\Middleware\CheckUniversity;
use App\Models\Journal;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class AccessControlSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
    }

    public function test_deactivated_user_cannot_access_protected_routes(): void
    {
        $university = University::factory()->create();
        $userRole = Role::where('name', Role::USER)->first();

        $inactiveUser = User::factory()->create([
            'role_id' => $userRole->id,
            'university_id' => $university->id,
            'is_active' => false,
        ]);

        $response = $this->actingAs($inactiveUser)->get(route('user.profil.index'));
        $response->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_deactivated_user_cannot_access_dashboard(): void
    {
        $university = University::factory()->create();
        $userRole = Role::where('name', Role::USER)->first();

        $inactiveUser = User::factory()->create([
            'role_id' => $userRole->id,
            'university_id' => $university->id,
            'is_active' => false,
        ]);

        $response = $this->actingAs($inactiveUser)->get(route('dashboard'));
        $response->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_deactivated_user_cannot_access_settings(): void
    {
        $university = University::factory()->create();
        $userRole = Role::where('name', Role::USER)->first();

        $inactiveUser = User::factory()->create([
            'role_id' => $userRole->id,
            'university_id' => $university->id,
            'is_active' => false,
        ]);

        $response = $this->actingAs($inactiveUser)->get(route('profile.edit'));
        $response->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_deactivated_user_receives_json_403_on_api_request(): void
    {
        $university = University::factory()->create();
        $userRole = Role::where('name', Role::USER)->first();

        $inactiveUser = User::factory()->create([
            'role_id' => $userRole->id,
            'university_id' => $university->id,
            'is_active' => false,
        ]);

        $response = $this->actingAs($inactiveUser)->getJson(route('dashboard'));
        $response->assertStatus(403);
        $this->assertGuest();
    }

    public function test_user_cannot_modify_journal_belonging_to_another_user(): void
    {
        $university = University::factory()->create();
        $userRole = Role::where('name', Role::USER)->first();

        $user1 = User::factory()->create([
            'role_id' => $userRole->id,
            'university_id' => $university->id,
            'is_active' => true,
        ]);

        $user2 = User::factory()->create([
            'role_id' => $userRole->id,
            'university_id' => $university->id,
            'is_active' => true,
        ]);

        $journalOfUser2 = Journal::factory()->create([
            'user_id' => $user2->id,
            'university_id' => $university->id,
        ]);

        // User 1 attempts to update OAI URLs of User 2's journal
        $response = $this->actingAs($user1)->patch(route('user.journals.update-oai-urls', $journalOfUser2), [
            'oai_urls' => ['https://example.com/oai'],
        ]);

        $response->assertStatus(403);
    }

    public function test_check_university_middleware_blocks_different_university_with_model_or_raw_id(): void
    {
        $middleware = new CheckUniversity();
        $userRole = Role::where('name', Role::ADMIN_KAMPUS)->first();

        $uni1 = University::factory()->create();
        $uni2 = University::factory()->create();

        $user = User::factory()->create([
            'role_id' => $userRole->id,
            'university_id' => $uni1->id,
            'is_active' => true,
        ]);

        // Case 1: Route param is Model of another university
        $request1 = Request::create('/test', 'GET');
        $request1->setUserResolver(fn () => $user);
        $request1->setRouteResolver(function () use ($uni2) {
            $route = new \Illuminate\Routing\Route('GET', '/test/{university}', []);
            $route->parameters = ['university' => $uni2];
            return $route;
        });

        try {
            $middleware->handle($request1, fn () => response('ok'));
            $this->fail('Expected 403 HttpException was not thrown for route model parameter');
        } catch (HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }

        // Case 2: Route param is raw numeric ID of another university
        $request2 = Request::create('/test', 'GET');
        $request2->setUserResolver(fn () => $user);
        $request2->setRouteResolver(function () use ($uni2) {
            $route = new \Illuminate\Routing\Route('GET', '/test/{university}', []);
            $route->parameters = ['university' => (string) $uni2->id];
            return $route;
        });

        try {
            $middleware->handle($request2, fn () => response('ok'));
            $this->fail('Expected 403 HttpException was not thrown for raw ID parameter');
        } catch (HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }

        // Case 3: Request input university_id of another university
        $request3 = Request::create('/test', 'POST', ['university_id' => $uni2->id]);
        $request3->setUserResolver(fn () => $user);
        $request3->setRouteResolver(function () {
            $route = new \Illuminate\Routing\Route('POST', '/test', []);
            $route->parameters = [];
            return $route;
        });

        try {
            $middleware->handle($request3, fn () => response('ok'));
            $this->fail('Expected 403 HttpException was not thrown for request body university_id');
        } catch (HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }

        // Case 4: Route param matches user university
        $request4 = Request::create('/test', 'GET');
        $request4->setUserResolver(fn () => $user);
        $request4->setRouteResolver(function () use ($uni1) {
            $route = new \Illuminate\Routing\Route('GET', '/test/{university}', []);
            $route->parameters = ['university' => $uni1];
            return $route;
        });

        $response4 = $middleware->handle($request4, fn () => response('ok'));
        $this->assertEquals('ok', $response4->getContent());
    }

    public function test_check_journal_ownership_middleware_blocks_unauthorized_access(): void
    {
        $middleware = new CheckJournalOwnership();
        $userRole = Role::where('name', Role::USER)->first();

        $uni = University::factory()->create();
        $owner = User::factory()->create([
            'role_id' => $userRole->id,
            'university_id' => $uni->id,
            'is_active' => true,
        ]);
        $otherUser = User::factory()->create([
            'role_id' => $userRole->id,
            'university_id' => $uni->id,
            'is_active' => true,
        ]);

        $journal = Journal::factory()->create([
            'user_id' => $owner->id,
            'university_id' => $uni->id,
        ]);

        // Case 1: Other user attempts access with Model instance
        $request1 = Request::create('/test', 'GET');
        $request1->setUserResolver(fn () => $otherUser);
        $request1->setRouteResolver(function () use ($journal) {
            $route = new \Illuminate\Routing\Route('GET', '/test/{journal}', []);
            $route->parameters = ['journal' => $journal];
            return $route;
        });

        try {
            $middleware->handle($request1, fn () => response('ok'));
            $this->fail('Expected 403 for unauthorized user with model parameter');
        } catch (HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }

        // Case 2: Other user attempts access with raw numeric ID
        $request2 = Request::create('/test', 'GET');
        $request2->setUserResolver(fn () => $otherUser);
        $request2->setRouteResolver(function () use ($journal) {
            $route = new \Illuminate\Routing\Route('GET', '/test/{journal}', []);
            $route->parameters = ['journal' => $journal->id];
            return $route;
        });

        try {
            $middleware->handle($request2, fn () => response('ok'));
            $this->fail('Expected 403 for unauthorized user with raw ID parameter');
        } catch (HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }

        // Case 3: Owner accesses their own journal
        $request3 = Request::create('/test', 'GET');
        $request3->setUserResolver(fn () => $owner);
        $request3->setRouteResolver(function () use ($journal) {
            $route = new \Illuminate\Routing\Route('GET', '/test/{journal}', []);
            $route->parameters = ['journal' => $journal];
            return $route;
        });

        $response3 = $middleware->handle($request3, fn () => response('ok'));
        $this->assertEquals('ok', $response3->getContent());
    }
}
